import logo_uach from "../assets/logoUach.png"
import logo_inf from "../assets/UACh_Informatica.png"


function Header(){
    return(
        <header className="w-full flex justify-between items-center px-6 py-4">
            <img src={logo_uach} alt="Logo UACh" className="h-30 mx-20"/>
            <img src={logo_inf} alt="Logo UACh Informatica" className="h-24 mx-20"/>
        </header>
    )
}
export default Header