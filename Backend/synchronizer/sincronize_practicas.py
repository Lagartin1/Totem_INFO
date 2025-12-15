from __future__ import annotations

import argparse
import io
import json
import os
import threading
import time
from typing import Any, Dict, List, Optional

import dotenv
import gspread
import pandas as pd
import requests
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

# ==========================================================
# Google Sheets (OAuth) - SOLO LECTURA (tu mismo correo)
# ==========================================================
# Scope readonly porque solo leemos
SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]

dotenv.load_dotenv()

# Estado persistente: archivo donde guardamos la última marca temporal subida
STATE_FILE = os.path.join(os.path.dirname(__file__), ".last_fetch.json")



def get_gspread_client_oauth(
    client_secret_path: str = "client_secret.json",
    token_path: str = "token.json",
) -> gspread.Client:
    """
    OAuth como USUARIO (tu correo). SOLO LECTURA.
    Arreglado para WSL: no intenta abrir el navegador con gio.
    """
    if not os.path.isfile(client_secret_path):
        raise FileNotFoundError(f"No existe {client_secret_path} (OAuth Desktop)")

    creds = None
    if os.path.isfile(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(client_secret_path, SCOPES)

            # ✅ CLAVE: en WSL evita gio/open browser
            creds = flow.run_local_server(port=0, open_browser=False)

            # Te va a mostrar una URL. Cópiala y pégala en tu navegador (Windows),
            # inicia sesión con el correo que tiene acceso a la Sheet, acepta permisos,
            # y vuelve al terminal: se completa solo.

        with open(token_path, "w", encoding="utf-8") as f:
            f.write(creds.to_json())

    return gspread.authorize(creds)

def read_sheet_by_url(sheet_url: str, worksheet_name: str = None):
    sheet_id = sheet_url.split("/d/")[1].split("/")[0]
    gc = get_gspread_client_oauth()
    sh = gc.open_by_key(sheet_id)

    if worksheet_name:
        ws = sh.worksheet(worksheet_name)
    else:
        ws = sh.sheet1

    return ws.get_all_values()


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


def extract_spreadsheet_id(url: str) -> Optional[str]:
    """Extrae el spreadsheetId desde una URL /d/<id>/..."""
    if not url:
        return None
    try:
        start = url.index("/d/") + 3
        rest = url[start:]
        end = rest.find("/")
        if end == -1:
            return rest
        return rest[:end]
    except ValueError:
        return None





def fetch_all_sheets_values(gc: gspread.Client, spreadsheet_id: str) -> Dict[str, List[Dict[str, Optional[str]]]]:
    """Devuelve dict: {sheet_title: [row_dicts]} para cada pestaña del spreadsheet."""
    ss = gc.open_by_key(spreadsheet_id)
    result: Dict[str, List[Dict[str, Optional[str]]]] = {}
    for ws in ss.worksheets():
        raw = ws.get_all_values()
        result[ws.title] = rows_to_dicts(raw)
    return result


def rows_to_dicts(values: List[List[str]]) -> List[Dict[str, Optional[str]]]:
    if not values:
        return []
    header = [str(h).strip() for h in values[0]]
    # Limit columns to the expected REQUIRED_HEADERS length (A-P) and skip empty header names
    max_cols = len(REQUIRED_HEADERS)
    data: List[Dict[str, Optional[str]]] = []
    for row in values[1:]:
        item: Dict[str, Optional[str]] = {}
        for i, h in enumerate(header):
            if i >= max_cols:
                break
            if not h:
                # Skip empty header names (e.g., empty column Q)
                continue
            item[h] = row[i] if i < len(row) else None
        data.append(item)
    return data


# Encabezados requeridos (orden corresponde a las columnas del sheet)
REQUIRED_HEADERS = [
    "marca_temporal",
    "tipo_practica",
    "nombre_contacto",
    "cargo_contacto",
    "correo_contacto",
    "telefono_contacto",
    "nombre_empresa",
    "sitio_web_empresa",
    "unidad_empresa",
    "fechas_practica",
    "modalidad",
    "sede_practica",
    "regimen_trabajo",
    "labores",
    "beneficios",
    "requisitos_especiales",
]


def normalize_headers(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normaliza/renombra los headers del DataFrame según REQUIRED_HEADERS.
    - Si #cols coincide exactamente, se reemplazan por completo respetando el orden.
    - Si hay más/menos, renombra por posición las primeras columnas.
    """
    if df is None or df.empty:
        return df

    current_cols = list(df.columns)
    n_curr = len(current_cols)
    n_req = len(REQUIRED_HEADERS)

    if n_curr == n_req:
        df.columns = REQUIRED_HEADERS
        return df

    mapping = {}
    for i, col in enumerate(current_cols):
        mapping[col] = REQUIRED_HEADERS[i] if i < n_req else col
    return df.rename(columns=mapping)


def push_to_database(session: requests.Session, dataframe: pd.DataFrame):
    api_upload_url = os.environ.get("API_UPLOAD_URL")
    if not api_upload_url:
        raise ValueError("Falta la variable de entorno API_UPLOAD_URL")

    send_as_file = os.environ.get("API_UPLOAD_AS_FILE", "false").lower() in ("1", "true", "yes")

    if send_as_file:
        csv_bytes = dataframe.to_csv(index=False).encode("utf-8")
        files = {"file": ("data.csv", io.BytesIO(csv_bytes), "text/csv")}
        data = {"infotype": "file"}
        rsp = session.post(api_upload_url, files=files, data=data)
    else:
        json_data = dataframe.to_dict(orient="records")
        rsp = session.post(api_upload_url, json={"data": json_data})

    if rsp.status_code == 401:
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
        return session

    psw = os.environ.get("SYNCRONIZER_PASSWORD") or os.environ.get("SYNC_PASSWORD")
    payload = {"password": psw} if psw is not None else {}

    try:
        rsp = session.post(auth_url, json=payload)
    except Exception:
        return session

    if rsp.status_code == 200:
        try:
            body = rsp.json()
            token = body.get("access_token") or body.get("token")
            if token:
                from urllib.parse import urlparse

                parsed = urlparse(auth_url)
                domain = parsed.hostname
                session.cookies.set("access_token", token, domain=domain, path="/")
                print(f"auth: access_token seteado en session.cookies para {domain}")
        except Exception as exc:
            print(f"auth: error al extraer token: {exc}")
    return session


def get_sheets_info() -> pd.DataFrame:
    """
    Lee TODAS las pestañas del Google Sheet indicado por SHEET_URL (env),
    y las concatena en un único DataFrame.
    """
    sheets_url = os.environ.get("SHEET_URL")
    if not sheets_url:
        raise ValueError("Falta la variable de entorno SHEET_URL")

    sheet_id = extract_spreadsheet_id(sheets_url)
    if not sheet_id:
        raise ValueError("No se pudo extraer SHEET_ID desde SHEET_URL")

    gc = get_gspread_client_oauth()
    sheets = fetch_all_sheets_values(gc, sheet_id)

    data: List[Dict[str, Optional[str]]] = []
    for _title, rows in sheets.items():
        data.extend(rows)

    df = pd.DataFrame(data)
    df = normalize_headers(df)
    # Drop any columns that ended up with an empty name (can occur if sheet has a trailing empty column)
    df = df.loc[:, [c for c in df.columns if str(c).strip() != ""]]
    return df


def tarea_google_sheets(intervalo: int, session: requests.Session) -> None:
    while True:
        try:
            df = get_sheets_info()
            if not (isinstance(df, pd.DataFrame) and not df.empty):
                print("No hay datos para subir en este ciclo.")
                time.sleep(intervalo)
                continue

            last_ts = _load_last_timestamp()

            df_ts = df.copy()
            if "marca_temporal" in df_ts.columns:
                df_ts["__ts"] = pd.to_datetime(df_ts["marca_temporal"], errors="coerce", dayfirst=True)
                if last_ts is not None:
                    mask = df_ts["__ts"] > pd.to_datetime(last_ts)
                    df_new = df_ts.loc[mask].drop(columns=["__ts"])
                else:
                    df_new = df_ts.drop(columns=["__ts"])
            else:
                df_new = df_ts

            if df_new.empty:
                print("No hay filas nuevas desde la última ejecución.")
                time.sleep(intervalo)
                continue

            success, _rsp = push_to_database(session, df_new)
            if success and "marca_temporal" in df_new.columns:
                try:
                    max_ts = pd.to_datetime(df_new["marca_temporal"], errors="coerce", dayfirst=True).max()
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
    fetch_sheets(60 * 60 * 6, session)  # cada 6 horas
    try:
        while True:
            time.sleep(2)
    except KeyboardInterrupt:
        print("Terminando sincronizador.")


if __name__ == "__main__":
    main()
