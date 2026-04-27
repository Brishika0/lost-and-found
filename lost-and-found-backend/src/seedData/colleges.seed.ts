import { Types } from "mongoose";

export const colleges = [
  {
    _id: new Types.ObjectId("650000000000000000000111"),
    name: "Demo College",
    domain: "gmail.com",
    logo: {
      url: "https://res.cloudinary.com/demo/image/upload/v1/colleges/herald/logo.png",
      publicId: "colleges/herald/logo",
      uploadedAt: new Date("2024-01-01"),
    },
    shortName: "Demo",
    adminIds: [], // Will be updated after users are created
    location: {
      address: "Naxal, Kathmandu",
      city: "Kathmandu",
      state: "Bagmati",
      country: "Nepal",
      coordinates: [85.324, 27.717],
    },
    contactInfo: {
      email: "info@democlz.edu.np",
      phone: "+977-1-4412345",
      website: "https://democollege.edu.np",
    },
    isActive: true,
    createdBy: new Types.ObjectId("650000000000000000000000"), // Superadmin
  },
  {
    _id: new Types.ObjectId("650000000000000000000001"),
    name: "Herald College Kathmandu",
    domain: "heraldcollege.edu.np",
    logo: {
      url: "https://res.cloudinary.com/demo/image/upload/v1/colleges/herald/logo.png",
      publicId: "colleges/herald/logo",
      uploadedAt: new Date("2024-01-01"),
    },
    shortName: "Herald",
    adminIds: [], // Will be updated after users are created
    location: {
      address: "Naxal, Kathmandu",
      city: "Kathmandu",
      state: "Bagmati",
      country: "Nepal",
      coordinates: [85.324, 27.717],
    },
    contactInfo: {
      email: "info@heraldcollege.edu.np",
      phone: "+977-1-4412345",
      website: "https://heraldcollege.edu.np",
    },
    isActive: true,
    createdBy: new Types.ObjectId("650000000000000000000000"), // Superadmin
  },
  {
    _id: new Types.ObjectId("650000000000000000000002"),
    name: "Islington College",
    domain: "islington.edu.np",
    logo: {
      url: "https://res.cloudinary.com/demo/image/upload/v1/colleges/islington/logo.png",
      publicId: "colleges/islington/logo",
      uploadedAt: new Date("2024-01-01"),
    },
    shortName: "Islington",
    adminIds: [],
    location: {
      address: "Kamalpokhari, Kathmandu",
      city: "Kathmandu",
      state: "Bagmati",
      country: "Nepal",
      coordinates: [85.319, 27.714],
    },
    contactInfo: {
      email: "info@islington.edu.np",
      phone: "+977-1-4432123",
      website: "https://islington.edu.np",
    },
    isActive: true,
    createdBy: new Types.ObjectId("650000000000000000000000"),
  },
  {
    _id: new Types.ObjectId("650000000000000000000003"),
    name: "Itahari International College",
    domain: "iic.edu.np",
    logo: {
      url: "https://res.cloudinary.com/demo/image/upload/v1/colleges/iic/logo.png",
      publicId: "colleges/iic/logo",
      uploadedAt: new Date("2024-01-01"),
    },
    shortName: "IIC",
    adminIds: [],
    location: {
      address: "Itahari, Sunsari",
      city: "Itahari",
      state: "Koshi",
      country: "Nepal",
      coordinates: [87.274, 26.663],
    },
    contactInfo: {
      email: "info@iic.edu.np",
      phone: "+977-25-581234",
      website: "https://iic.edu.np",
    },
    isActive: true,
    createdBy: new Types.ObjectId("650000000000000000000000"),
  },
  {
    _id: new Types.ObjectId("650000000000000000000004"),
    name: "Softwarica College",
    domain: "softwarica.edu.np",
    logo: {
      url: "https://res.cloudinary.com/demo/image/upload/v1/colleges/softwarica/logo.png",
      publicId: "colleges/softwarica/logo",
      uploadedAt: new Date("2024-01-01"),
    },
    shortName: "Softwarica",
    adminIds: [],
    location: {
      address: "Dillibazar, Kathmandu",
      city: "Kathmandu",
      state: "Bagmati",
      country: "Nepal",
      coordinates: [85.328, 27.711],
    },
    contactInfo: {
      email: "info@softwarica.edu.np",
      phone: "+977-1-4567890",
      website: "https://softwarica.edu.np",
    },
    isActive: true,
    createdBy: new Types.ObjectId("650000000000000000000000"),
  },
  {
    _id: new Types.ObjectId("650000000000000000000005"),
    name: "Kathmandu University School of Management",
    domain: "kusom.edu.np",
    logo: {
      url: "https://res.cloudinary.com/demo/image/upload/v1/colleges/kusom/logo.png",
      publicId: "colleges/kusom/logo",
      uploadedAt: new Date("2024-01-01"),
    },
    shortName: "KUSOM",
    adminIds: [],
    location: {
      address: "Balkumari, Lalitpur",
      city: "Lalitpur",
      state: "Bagmati",
      country: "Nepal",
      coordinates: [85.322, 27.672],
    },
    contactInfo: {
      email: "info@kusom.edu.np",
      phone: "+977-1-5212345",
      website: "https://kusom.edu.np",
    },
    isActive: true,
    createdBy: new Types.ObjectId("650000000000000000000000"),
  },
];
