import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'redesociaisetic@gmail.com',
        pass: 'et1c#2o19'
    }
});