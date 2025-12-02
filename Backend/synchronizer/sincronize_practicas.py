from __future__ import annotations
import argparse
import os
import time
import threading
from typing import List, Dict, Any, Optional
import dotenv
import io
import requests
import pandas as pd
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Scope readonly porque solo leemos
SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]

dotenv.load_dotenv()

# Estado persistente: archivo donde guardamos la última marca temporal subida
STATE_FILE = os.path.join(os.path.dirname(__file__), ".last_fetch.json")


def _load_last_timestamp() -> Optional[pd.Timestamp]:
	if not os.path.isfile(STATE_FILE):
		return None
	try:
		with open(STATE_FILE, "r", encoding="utf-8") as f:
			j = json.load(f)
		ts = j.get("last")
		if not ts:
			return None
		return pd.to_datetime(ts)
	except Exception:
		return None


def _save_last_timestamp(ts: pd.Timestamp) -> None:
	try:
		iso = pd.Timestamp(ts).isoformat()
		with open(STATE_FILE, "w", encoding="utf-8") as f:
			json.dump({"last": iso}, f)
	except Exception as exc:
		print(f"Advertencia: no se pudo guardar la última marca temporal: {exc}")

def get_sheets_service(creds_path: Optional[str] = None, api_key: Optional[str] = None):
	"""Crea y retorna el cliente de Google Sheets.

	Si se proporciona `api_key` se usa `developerKey` (acceso a hojas públicas).
	Si no, se espera `creds_path` apuntando al JSON de la cuenta de servicio.
	"""
	if api_key:
		service = build("sheets", "v4", developerKey=api_key)
		return service

	if not creds_path:
		raise ValueError("Se requieren credenciales (creds_path) o una api_key")
	if not os.path.isfile(creds_path):
		raise FileNotFoundError(f"Credenciales no encontradas: {creds_path}")
	creds = service_account.Credentials.from_service_account_file(creds_path, scopes=SCOPES)
	service = build("sheets", "v4", credentials=creds)
	return service


def fetch_sheet_values(service, spreadsheet_id: str, range_name: str) -> List[List[str]]:
	sheet = service.spreadsheets()
	result = sheet.values().get(spreadsheetId=spreadsheet_id, range=range_name).execute()
	values = result.get("values", [])
	return values


def fetch_all_sheets_values(service, spreadsheet_id: str) -> Dict[str, List[Dict[str, Optional[str]]]]:
	"""Devuelve un dict con {sheet_title: [row_dicts]} para cada hoja del spreadsheet."""
	ss = service.spreadsheets()
	meta = ss.get(spreadsheetId=spreadsheet_id, fields="sheets.properties.title").execute()
	sheets = meta.get("sheets", [])
	result: Dict[str, List[Dict[str, Optional[str]]]] = {}
	for s in sheets:
		title = s.get("properties", {}).get("title")
		if not title:
			continue
		raw = fetch_sheet_values(service, spreadsheet_id, title)
		result[title] = rows_to_dicts(raw)
	return result


def rows_to_dicts(values: List[List[str]]) -> List[Dict[str, Optional[str]]]:
	if not values:
		return []
	header = [str(h).strip() for h in values[0]]
	data = []
	for row in values[1:]:
		item: Dict[str, Optional[str]] = {}
		for i, h in enumerate(header):
			item[h] = row[i] if i < len(row) else None
		data.append(item)
	return data


def build_dataframes_from_data(data: Any, all_sheets: bool):
	"""Convierte la estructura de datos (listas de dicts) en DataFrame(s)."""
	if all_sheets:
		dfs: Dict[str, pd.DataFrame] = {title: pd.DataFrame(rows) for title, rows in data.items()}
		return dfs
	else:
		df = pd.DataFrame(data)
		return df


def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
	parser = argparse.ArgumentParser(description="Fetch Google Sheets to DataFrame")
	parser.add_argument("--sheet-id", dest="sheet_id", help="Spreadsheet ID")
	parser.add_argument("--sheet-url", dest="sheet_url", help="Spreadsheet URL")
	parser.add_argument("--api-key", dest="api_key", help="Google API key")
	parser.add_argument("--creds", dest="creds", help="Path to service account credentials JSON")
	parser.add_argument("--all", dest="all", action="store_true", help="Fetch all sheets")
	parser.add_argument("--range", dest="range", help="Range to fetch, e.g. Sheet1!A1:Z")
	return parser.parse_args(argv)


def fetch_dataframes(argv: Optional[List[str]] = None):
	args = parse_args(argv)

	sheet_id = args.sheet_id or (extract_spreadsheet_id(args.sheet_url) if args.sheet_url else None)
	if not sheet_id:
		raise ValueError("Se requiere SHEET_ID o SHEET_URL para obtener los datos")

	api_key = args.api_key
	creds_path = args.creds
	if not api_key and not creds_path:
		raise ValueError("Se requieren credenciales: GOOGLE_API_KEY/KEY_API o GOOGLE_SHEETS_CREDS")

	service = get_sheets_service(creds_path=creds_path, api_key=api_key)

	if args.all:
		data = fetch_all_sheets_values(service, sheet_id)
	else:
		if not args.range:
			raise ValueError("Se requiere SHEET_RANGE cuando no se usa --all")
		values = fetch_sheet_values(service, sheet_id, args.range)
		data = rows_to_dicts(values)

	dfs = build_dataframes_from_data(data, args.all)
	return dfs


def extract_spreadsheet_id(url: str) -> Optional[str]:
	if not url:
		return None
	try:
		start = url.index('/d/') + 3
		rest = url[start:]
		end = rest.find('/')
		if end == -1:
			return rest
		return rest[:end]
	except ValueError:
		return None


# Encabezados requeridos (orden corresponde a las columnas del sheet)
REQUIRED_HEADERS = [
	'marca_temporal',
	'tipo_practica',
	'nombre_contacto',
	'cargo_contacto',
	'correo_contacto',
	'telefono_contacto',
	'nombre_empresa',
	'sitio_web_empresa',
	'unidad_empresa',
	'fechas_practica',
	'modalidad',
	'sede_practica',
	'regimen_trabajo',
	'labores',
	'beneficios',
	'requisitos_especiales'
]


def normalize_headers(df: pd.DataFrame) -> pd.DataFrame:
	"""Normaliza/renombra los headers del DataFrame según REQUIRED_HEADERS.

	- Si el número de columnas coincide exactamente, se reemplazan por completo
	  respetando el orden.
	- Si hay más o menos columnas, se renombrarán las primeras columnas
	  por posición y se preservarán las columnas restantes.
	"""
	if df is None or df.empty:
		return df

	current_cols = list(df.columns)
	n_curr = len(current_cols)
	n_req = len(REQUIRED_HEADERS)

	if n_curr == n_req:
		df.columns = REQUIRED_HEADERS
		return df

	# Map by index for the minimum length; keep remaining names as-is
	mapping = {}
	for i, col in enumerate(current_cols):
		if i < n_req:
			mapping[col] = REQUIRED_HEADERS[i]
		else:
			mapping[col] = col

	return df.rename(columns=mapping)


def push_to_database(session: requests.Session, dataframe: pd.DataFrame):
	api_upload_url = os.environ.get("API_UPLOAD_URL")
	if not api_upload_url:
		raise ValueError("Falta la variable de entorno API_UPLOAD_URL")
	# Decide whether to send as JSON or as multipart/form-data
	send_as_file = os.environ.get("API_UPLOAD_AS_FILE", "false").lower() in ("1", "true", "yes")

	if send_as_file:
		# Convert DataFrame to CSV in memory and send as 'file' field (text/csv)
		csv_bytes = dataframe.to_csv(index=False).encode("utf-8")
		files = {"file": ("data.csv", io.BytesIO(csv_bytes), "text/csv")}
		data = {"infotype": "file"}
		rsp = session.post(api_upload_url, files=files, data=data)
	else:
		json_data = dataframe.to_dict(orient="records")
		rsp = session.post(api_upload_url, json={"data": json_data})
	if rsp.status_code == 401:
		# Reautenticar y reintentar
		auth(session)
		if send_as_file:
			rsp = session.post(api_upload_url, files=files, data=data)
		else:
			rsp = session.post(api_upload_url, json={"data": json_data})

	success = rsp.status_code in (200, 201)
	if not success:
		print(f"Error al subir datos: {rsp.status_code} - {rsp.text}")
	else:
		print("Datos subidos correctamente.", rsp.text)
	return success, rsp


def auth(session: requests.Session) -> requests.Session:
	auth_url = os.environ.get("API_AUTH_URL")
	if not auth_url:
		# No hay endpoint de auth configurado; devolver sesión tal cual
		return session
	psw = os.environ.get("SYNCRONIZER_PASSWORD") or os.environ.get("SYNC_PASSWORD")
	payload = {"password": psw} if psw is not None else {}
	try:
		rsp = session.post(auth_url, json=payload)
	except Exception:
		return session

	if rsp.status_code == 200:
		# Extraer token del JSON y setearlo como cookie manualmente
		try:
			body = rsp.json()
			token = body.get("access_token") or body.get("token")
			if token:
				# Setear cookie access_token para que las peticiones subsiguientes la incluyan
				from urllib.parse import urlparse
				parsed = urlparse(auth_url)
				domain = parsed.hostname
				session.cookies.set("access_token", token, domain=domain, path="/")
				print(f"auth: access_token seteado en session.cookies para {domain}")
		except Exception as exc:
			print(f"auth: error al extraer token: {exc}")
	return session


def get_sheets_info() -> pd.DataFrame:
	api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("KEY_API")
	creds = os.environ.get("GOOGLE_SHEETS_CREDS")
	sheets_url = os.environ.get("SHEET_URL")
	if not sheets_url:
		raise ValueError("Falta la variable de entorno SHEET_URL")

	sheet_id = extract_spreadsheet_id(sheets_url)
	service = get_sheets_service(creds_path=creds, api_key=api_key)
	sheets = fetch_all_sheets_values(service, sheet_id)

	data: List[Dict[str, Optional[str]]] = []
	for title, rows in sheets.items():
		data.extend(rows)

	df = build_dataframes_from_data(data, all_sheets=False)
	# Normalizar headers para que coincidan con los esperados por el backend
	try:
		df = normalize_headers(df)
	except Exception as exc:
		print(f"Advertencia: no se pudieron normalizar headers: {exc}")
	return df


def tarea_google_sheets(intervalo: int, session: requests.Session) -> None:
	while True:
		try:
			df = get_sheets_info()
			if not (isinstance(df, pd.DataFrame) and not df.empty):
				print("No hay datos para subir en este ciclo.")
				time.sleep(intervalo)
				continue

			# Cargar última marca temporal persistida
			last_ts = _load_last_timestamp()
			# Preparar copia para parsear timestamps
			df_ts = df.copy()
			if 'marca_temporal' in df_ts.columns:
				# Parse dates assuming day-first format (DD/MM/YYYY ...)
				df_ts['__ts'] = pd.to_datetime(df_ts['marca_temporal'], errors='coerce', dayfirst=True)
				if last_ts is not None:
					mask = df_ts['__ts'] > pd.to_datetime(last_ts)
					df_new = df_ts.loc[mask].drop(columns=['__ts'])
				else:
					df_new = df_ts.drop(columns=['__ts'])
			else:
				# Si no hay columna de timestamp, no filtramos
				df_new = df_ts

			if df_new.empty:
				print("No hay filas nuevas desde la última ejecución.")
				time.sleep(intervalo)
				continue

			# Enviar solo las filas nuevas
			success, rsp = push_to_database(session, df_new)
			if success:
				if 'marca_temporal' in df_new.columns:
					try:
						# Use dayfirst=True to match spreadsheet format like DD/MM/YYYY
						max_ts = pd.to_datetime(df_new['marca_temporal'], errors='coerce', dayfirst=True).max()
						if pd.notna(max_ts):
							_save_last_timestamp(max_ts)
					except Exception as exc:
						print(f"Advertencia al guardar última marca temporal: {exc}")
		except Exception as exc:
			print(f"Error en tarea_google_sheets: {exc}")
		time.sleep(intervalo)


def fetch_sheets(intervalo: int, session: requests.Session) -> threading.Thread:
	t = threading.Thread(target=tarea_google_sheets, args=(intervalo, session), daemon=True)
	t.start()
	return t


def main() -> None:
	session = requests.Session()
	auth(session)
	fetch_sheets(60*60*6, session)  # tarea cada 6 horas
	try:
		while True:
			time.sleep(2)
	except KeyboardInterrupt:
		print("Terminando sincronizador.")


if __name__ == "__main__":
	main()

