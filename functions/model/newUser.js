class newUser {

    constructor(){
        this.id;
        this.email;
        this.city;
        this.state;
    }

    static setId(ID){ this.id = ID; }
    static getId(){ return this.id;}

    static setEmail(mail){ this.email = mail;}
    static getEmail(){return this.email;}

    static setCity(City){ this.city = City;}
    static getCity(){return this.city;}

    static setState(State){ this.state = State;}
    static getState(){return this.state;}
    


}//end of class

module.exports = newUser;