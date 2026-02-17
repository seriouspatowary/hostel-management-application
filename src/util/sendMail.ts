import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
  service: 'gmail',  
  secure: true,      
  auth: {
    user: process.env.EMAIL_USER as string,
    pass: process.env.EMAIL_PASS as string,
  },
});


const sendMail = async (
  toEmail: string,
  subject: string,
  htmlTemplate: string
): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject,
    html: htmlTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

export default sendMail;
