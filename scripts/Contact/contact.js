import { showBootstrapToast,toggleBreadcrumb } from "../helpers.js";
import { Router } from "../router.js";
const messgebtn = document.getElementById("messagebtn")

const form = document.getElementById("contactForm");


document.addEventListener("pageLoaded", (e) => 
{
    if (e.detail.page === "contact") 
    {
        toggleBreadcrumb("Contact", true);

        messgebtn.addEventListener("click", function(){

            if (!form.checkValidity()) {
                e.preventDefault(); 
                alert("Please fill all fields.");
            }else {
                e.preventDefault()
                e.stopImmediatePropagation()
                showBootstrapToast("thasnks for your message") 
                Router.navigate("home")
            }
                    
        })
    }
});