export type Review = {
  name: string;
  initials: string;
  rating: number;
  date: string;
  text: string;
  source: "Google";
};

export const reviews: Review[] = [
  {
    name: "Yash",
    initials: "Y",
    rating: 5,
    date: "2 years ago",
    text: "Whether in the day or at night, whenever any help was needed they were there. Absolutely caring towards the client and professional in their work. Totally recommend them for your travel planning.",
    source: "Google",
  },
  {
    name: "Rohit Sharma",
    initials: "RS",
    rating: 5,
    date: "1 year ago",
    text: "Good food, excellent service by Dinesh Jain, manager of Jain Tours and Travels. Our family trip was perfectly arranged from start to finish.",
    source: "Google",
  },
  {
    name: "Priya Mehta",
    initials: "PM",
    rating: 5,
    date: "8 months ago",
    text: "Amazing facilities and services from the team and value for money. Our Maldives honeymoon was beyond our expectations — every detail was perfect.",
    source: "Google",
  },
  {
    name: "Anil Kapoor",
    initials: "AK",
    rating: 5,
    date: "1 year ago",
    text: "Booked our European tour through Jain Tours. The itinerary was thoughtful, the hotels were premium, and Dinesh ji was always a call away.",
    source: "Google",
  },
  {
    name: "Sneha Iyer",
    initials: "SI",
    rating: 5,
    date: "6 months ago",
    text: "Trusted them for our Kerala family trip — houseboat, hotels, and transport were all top-notch. Very personal attention throughout.",
    source: "Google",
  },
  {
    name: "Mehul Shah",
    initials: "MS",
    rating: 5,
    date: "10 months ago",
    text: "Professional and quick with bookings. Got our visa, flights and Sri Lanka package handled effortlessly. Will book again.",
    source: "Google",
  },
  {
    name: "Kavita R.",
    initials: "KR",
    rating: 4,
    date: "1 year ago",
    text: "Good service, kind staff and very transparent pricing. The Dubai package was well organised.",
    source: "Google",
  },
  {
    name: "Vikram Patel",
    initials: "VP",
    rating: 5,
    date: "3 months ago",
    text: "Cordelia cruise booking was seamless. Stateroom upgrades, port transfers — handled like clockwork. Highly recommend.",
    source: "Google",
  },
];

export const ratingDistribution = [
  { stars: 5, count: 128 },
  { stars: 4, count: 10 },
  { stars: 3, count: 2 },
  { stars: 2, count: 1 },
  { stars: 1, count: 1 },
];
