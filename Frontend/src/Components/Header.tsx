import logo_uach from "../assets/logoUach.png"
import logo_inf from "../assets/UACh_Informatica.png"


function Header(){
    return(
        <header className="w-full flex flex-row items-center">
            <img src={logo_uach} alt="Logo UACh" className="h-30 mx-4"/>
            <img src={logo_inf} alt="Logo UACh Informatica" className="h-24 mx-4"/>
        </header>
    )
    

}
export default Header