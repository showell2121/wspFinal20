function auth(email, success, fail_url){

    firebase.auth().onAuthStateChanged(user => {

        if (user) {
            success()
        } else {
            window.location.href = fail_url
        }

    })


}