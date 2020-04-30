class newClass {

    constructor(){
        this.name;
        this.id;            //Class ID, level of class e.g 4910, mulitple classes 
        this.crn;           //Class CRN, specific class
        this.department;
        this.classStart;    //month class starts
        this.classEnd;
        this.startTime;     //Time class starts
        this.endTime; 
        this.daysOfClass;   //What days of the week is class help
        this.classRoom;     //Room class is held in. 
        this.classProf;
    }

    // constructor(className){
    //     this.name = className;
    //     this.id;            //Class ID, level of class e.g 4910, mulitple classes 
    //     this.crn;           //Class CRN, specific class
    //     this.department;
    //     this.classStart;    //month class starts
    //     this.classEnd;
    //     this.startTime;     //Time class starts
    //     this.endTime; 
    //     this.daysOfClass;   //What days of the week is class help
    //     this.classRoom;     //Room class is held in. 
    //     this.classProf;
    // }

    static setId(nam){ this.name = nam; }
    static getId(){ return this.name;}

    static setId(ID){ this.id = ID; }
    static getId(){ return this.id;}

    static setId(cr){ this.crn = cr; }
    static getId(){ return this.crn;}

    static setId(depart){ this.department = depart; }
    static getId(){ return this.department;}

    static setId(classSt){ this.classStart = classSt; }
    static getId(){ return this.classStart;}

    static setId(classE){ this.classEnd = classE; }
    static getId(){ return this.classEnd;}
   
    static setId(startT){ this.startTime = startT; }
    static getId(){ return this.startTime;}

    static setId(endT){ this.endTime = endT; }
    static getId(){ return this.endTime;}
        
    static setId(daysOfCl){ this.daysOfClass = daysOfCl; }
    static getId(){ return this.daysOfClass;}
    
    static setId(classR){ this.classRoom = classR; }
    static getId(){ return this.classRoom;}

    static setId(classPr){ this.classProf = classPr; }
    static getId(){ return this.classProf;}


}//end of class

module.exports = newClass;