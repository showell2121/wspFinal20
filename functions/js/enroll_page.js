function enroll_page() {

    enroll_page_secured();
}


let list = [];


async function enroll_page_secured() {

    try {
        //empty array
        list = [];

        //creates snapshop of attributes in database in specificied collection
        //gets all the documents
        const snapshot = await firebase.firestore().collection("classes").get();

        glPageContent.innerHTML += ` <h1> <i>Student Enrollment </i></h1>`

        //iterates through the documents.
        snapshot.forEach(doc => {

            //console.log("////////////", doc.data().class)
            doc.data().class.forEach(value => {
                //console.log(value.name)
                //javascript object for data
                const p = {
                    name: value.name, courseId: value.id, crn: value.crn, depart: value.department, days: value.daysOfClass,
                    room: value.classRoom, startDate: value.classStart, endDate: value.classEnd, startTime: value.startTime, endTime: value.endTime,
                    professor: value.classProf
                }
                list.push(p)
            })


        });
    } catch (e) {
        //displays error if one occurs
        glPageContent.innerHTML = 'Firestore access error. Try again <br>' + e
    }

    for (var i = 0; i < list.length; i++) {

        //console.log(list[i].name)
        glPageContent.innerHTML += `

                                
                                
                    <table id="tab2">
                    <thead>
                        <th>Name</th>
                        <th>Course ID</th>
                        <th>CRN</th>
                        <th style="white-space: nowrap;">Department</th>
                        <th>Days</th>
                        <th style="white-space: nowrap;">Room</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Time</th>
                        <th>Professor</th>                
                    </thead>
                    <tbody>               
       
                                 <tr>
                                <td> 
                                    ${list[i].crn}
                                    <input type="hidden" class="form-control" id="name" name="name" readonly>
                                </td>
                                <td>
                                    ${list[i].courseId}
                                    <input type="hidden" class="form-control"  id="id" name="id" readonly>                            
                                </td>
                                <td>
                                    ${list[i].crn}
                                    <input type="hidden" class="form-control" id="crn" name="crn"
                                        readonly>
                                </td>
                                <td>
                                    ${list[i].depart}
                                    <input type="hidden" class="form-control"  id="department"
                                        name="department" readonly>
                                </td>
                                <td>
                                    ${list[i].days}
                                    <input type="hidden" class="form-control" id="daysOfClass"
                                        name="daysOfClass" readonly>
                                </td>
                                <td>
                                    ${list[i].room}
                                    <input type="hidden" class="form-control"  id="classRoom"
                                        name="classRoom" readonly>
                                </td>
                                <td>
                                    ${list[i].startDate}
                                    <input type="hidden" class="form-control" vid="classStart"
                                        name="classStart" readonly>
                                </td>
                                <td>
                                    ${list[i].endDate}
                                    <input type="hidden" class="form-control"  id="classEnd"
                                        name="classEnd" readonly>
                                </td>
                                <td>
                                    ${list[i].startTime} - ${list[i].endTime}
                                    <input type="hidden" class="form-control"  id="startTime"
                                        name="startTime" readonly>
                                    <input type="hidden" class="form-control"  id="endTime"
                                        name="endTime" readonly>
                                </td>
                                <td>
                                    ${list[i].professor}
                                    <input type="hidden" class="form-control"  id="classProf"
                                        name="classProf" readonly>
                                </td>
                                <td>
                                    <button type="button" id="button2" value="${i}" class="btn btn-Success" style="background-color: #4CAF50; color: white;" onclick="addValue(${i})"> Enroll</button>
                                </td>


                            </tr>
                        



                    


                    </tbody>
                </table>
                `

    }


    


}

async function addValue(value){

    console.log("//////////" , value)

}