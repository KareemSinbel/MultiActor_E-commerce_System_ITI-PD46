import { showBootstrapToast,toggleBreadcrumb } from "../helpers.js";
import { Router } from "../router.js";



document.addEventListener("pageLoaded", (e) => 
{
    if (e.detail.page === "contact") 
    {
        toggleBreadcrumb("Contact", true);

        const messgebtn = document.getElementById("messagebtn")
        const form = document.getElementById("contactForm");

        messgebtn.addEventListener("click", function()
        {
            if (!form.checkValidity()) 
            {
                showBootstrapToast("Please fill all fields.",null, "danger");
            }else 
            {
                showBootstrapToast("Thanks for your message") 
                Router.navigate("home")
            }
                    
        })
    }
});