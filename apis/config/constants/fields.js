exports.REGISTER = [
   {
      label: 'Name',
      field: "textfield",
      fieldname: 'name',
      placeholder: 'Enter your name',
      validationtxt: 'Name required',
      required: true,
      readonly: false
   },
   {
      label: 'Email',
      field: "textfield",
      fieldname: 'email',
      placeholder: 'Enter your email',
      validationtxt: 'Email required',
      required: true,
      readonly: false
   },
]

exports.ADDRESS = [
   {
      label: 'Address Type',
      field: "tag",
      fieldname: 'type',
      placeholder: 'Address Type',
      validationtxt: 'Select an address type',
      values: [
         {
            "text": "Home",
            "value": "Home"
         },
         {
            "text": "Work",
            "value": "Work"
         },
         {
            "text": "Other",
            "value": "Other"
         }
      ],
      required: true,
      readonly: false
   }, {
      label: 'First Line',
      field: "textfield",
      fieldname: 'firstline',
      placeholder: 'Enter address first line',
      validationtxt: 'Address firstline required',
      required: true,
      readonly: false
   }, {
      label: 'Second Line',
      field: "textfield",
      fieldname: 'secondline',
      placeholder: 'Enter address second line',
      validationtxt: 'Address firstline required',
      required: false,
      readonly: false
   }, {
      label: 'Area',
      field: "textfield",
      fieldname: 'area',
      placeholder: 'Area',
      validationtxt: 'Area required',
      required: false,
      readonly: false
   }, {
      label: 'Landmark',
      field: "textfield",
      fieldname: 'landmark',
      placeholder: 'Landmark',
      validationtxt: 'Landmark required',
      required: true,
      readonly: false
   }, {
      label: 'City',
      field: "textfield",
      fieldname: 'city',
      placeholder: 'City',
      validationtxt: 'City required',
      required: true,
      readonly: false
   }, {
      label: 'Pincode',
      field: "textfield",
      fieldname: 'pincode',
      placeholder: 'Pincode',
      validationtxt: 'Pincode required',
      required: true,
      readonly: false
   }, {
      label: 'State',
      field: "textfield",
      fieldname: 'state',
      placeholder: 'State',
      validationtxt: 'State required',
      required: true,
      readonly: false
   },
]