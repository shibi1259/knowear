const mongoose = require('mongoose');

const aboutUsSchema = new mongoose.Schema({
  refid: { type: String, required: true, unique: true, default: 'about-us' },
  
  // Section 1
  section1: {
    heading: { type: String, required: true },
    paragraph: { type: String, required: true },
    banner1: { type: String, required: true },
    banner2: { type: String, required: true },
    mobileBanner1: { type: String, required: true },
    button1: {
      label: { type: String, required: true },
      link: { type: String, required: true },
    },
    button2: {
      label: { type: String },
      link: { type: String },
    }
  },
  
  // Section 2
  section2: {
    heading: { type: String, required: true },
    paragraph: { type: String, required: true },
    banner: { type: String, required: true },
    mobileBanner2: { type: String, required: true },
    bannerHeading: { type: String, required: true },
    bannerDescription: { type: String, required: true },
    button: {
      label: { type: String, required: true },
      link: { type: String, required: true },
    }
  },
  
  // Section 3
  section3: {
    heading: { type: String, required: true },
    paragraph: { type: String, required: true },
    mobileBanner3: { type: String, required: true }
  },
  
  // Counter Section
  counters: [
    {
      label: { type: String, required: true },
      value: { type: String, required: true }
    }
  ],
  seoSection: {
         title: { type: String },
         description: { type: String },
         keywords: { type: String },
         image: { type: String },
         canonical: { type: String },
         xCard: { type: String }
      },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('about.details', aboutUsSchema);