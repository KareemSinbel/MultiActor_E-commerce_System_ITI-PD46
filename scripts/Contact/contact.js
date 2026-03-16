import { showBootstrapToast,toggleBreadcrumb } from "../helpers.js";
import { Router } from "../router.js";



document.addEventListener("pageLoaded", (e) => 
{
    const messgebtn = document.getElementById("messagebtn")

    const form = document.getElementById("contactForm");
    if (e.detail.page === "contact") 
    {
        toggleBreadcrumb("Contact", true);

        messgebtn.addEventListener("click", function(){
            console.log("clicked")
            if (!form.checkValidity()) {
                //e.preventDefault(); 
                alert("Please fill all fields.");
            }else {
                //e.preventDefault()
                console.log("hello")
                // e.stopImmediatePropagation()
                showBootstrapToast("thasnks for your message") 
                Router.navigate("home")
            }
                    
        })
    }
});