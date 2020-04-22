var teamUsername = "HelpANeighborInfo@gmail.com";
var teamPass = "HelpaNeighbor!7";

exports.sendEmail = function (email, item, email2, phone) {
    'use strict';
    //require('dotenv').config();

    const nodemailer = require('nodemailer');
    //console.log("In Send email2222");


    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    nodemailer.createTestAccount((err, account) => {

        if(err){
            return;
        }
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: teamUsername, // Gmail username
                pass: teamPass // Gmail password
            }
        });


        // setup email data with unicode symbols
        let mailOptions = {
            from: '"Help-A-Neighbor." <HelpANeighbor@gmail.com>', // sender address
            to: email, // list of receivers
            subject: 'You Have Assistance', // Subject line
            text: "The Following user from Help-A-Neighbor wants to help you with item: " +

                item + ". " +
                "You can contact them at: " +

                "Email: " + email2 +
                " OR Call/Text: " + phone +
                ". Remember we recommend you meet in a well populated area to collect you supplies." , // plain text body
                
            //html: "Temporary Code: " + verCode // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            } else {
                console.log('Message sent: %s', info.messageId);

                return null;
            }

            // Preview only available when sending through an Ethereal account
            //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        });
    });


    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    
}