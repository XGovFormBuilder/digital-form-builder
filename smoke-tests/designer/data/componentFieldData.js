// TODO Use real data based on an actual form for the components
module.exports = {
  date: {
    title: "Date of Birth",
    name: "dateOfBirth",
    hint: "Please enter your date of birth using the format dd/mm/yyyy",
  },
  dateTime: {
    title: "Date Time",
    name: "dateTime",
    hint: "Please enter the date and time of your purchase",
  },
  emailAddress: {
    title: "Your Email Address",
    name: "emailAddress",
    hint: "Please enter your email adress",
  },
  dateParts: {
    title: "Your Import",
    name: "importDate",
    hint: "Please enter the estimated date of arrival of your goods",
  },
  text: {
    title: "Your Vehicle Make and Model",
    name: "vehicleMakeAndModel",
    hint: "Please enter your vehicle using the format: BMW, 3 Series",
  },
  list: {
    title: "Local list test",
    name: "LocalList",
    hint: "An automated test for creating local lists",
  },
  paragraph: {
    content: `You need the vehicle’s number plate (registration number).\n
          You can see the results as soon as the MOT centre has recorded the test result.\n
          You’ll need the 11-digit number from the vehicle’s log book (V5C) to see the test location.`,
  },
  yesNo: {
    title: "Do you have a Passport?",
    name: "yesNo",
    hint: "An automated test for creating YesNo",
  },
};
