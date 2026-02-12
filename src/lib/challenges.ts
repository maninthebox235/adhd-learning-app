import { DailyChallenge } from "./types";

const CHALLENGES: Omit<DailyChallenge, "id" | "date">[] = [
  {
    title: "Trick Shot Inventor",
    description:
      "Come up with 3 creative trick shots a goalie could try during practice. Describe each one and give it a cool name!",
    category: "hockey",
  },
  {
    title: "Lego Speed Build",
    description:
      "Build something using only 20 Lego pieces in 10 minutes. Take a photo or describe what you made!",
    category: "building",
  },
  {
    title: "60-Second Video Challenge",
    description:
      "Plan a 60-second video about your favorite hobby. Write out what happens in each 15-second chunk!",
    category: "creative",
  },
  {
    title: "Science Mystery",
    description:
      "Why does ice float on water? Most solids sink! Figure out why ice is different and explain it like you're teaching a friend.",
    category: "science",
  },
  {
    title: "Design Your Dream Rink",
    description:
      "If you could design the ultimate hockey rink, what would it look like? Think about crazy features, special effects, and cool gadgets!",
    category: "hockey",
  },
  {
    title: "Lego Story Builder",
    description:
      "Build a Lego scene that tells a story. It could be an adventure, a funny moment, or something from a movie. Then describe the story!",
    category: "building",
  },
  {
    title: "Thumbnail Designer",
    description:
      "Design a YouTube thumbnail for a video called 'World's CRAZIEST Saves'. Describe or sketch what it would look like — colors, text, and images!",
    category: "creative",
  },
  {
    title: "Animal Architect",
    description:
      "Pick any animal. Now design a house perfect for that animal using Lego-like building techniques. What special features would it need?",
    category: "building",
  },
  {
    title: "Goalie Training Program",
    description:
      "Create a fun 15-minute practice routine for goalies. Include 3 drills and give each one a cool name!",
    category: "hockey",
  },
  {
    title: "Invention Time",
    description:
      "Invent something that doesn't exist yet! It can be silly or serious. Describe what it does, what it looks like, and give it a name.",
    category: "science",
  },
  {
    title: "Video Game Designer",
    description:
      "Design a new video game. What's the main character? What's the goal? What makes it different from other games?",
    category: "creative",
  },
  {
    title: "Sports Science",
    description:
      "Why does a hockey puck slide so easily on ice? Research or guess the science behind it and explain it in your own words!",
    category: "science",
  },
  {
    title: "Mini Movie Script",
    description:
      "Write a short script for a 2-minute movie. Include the characters, the setting, and what happens. Bonus: plan the camera angles!",
    category: "creative",
  },
  {
    title: "Impossible Lego Challenge",
    description:
      "Try to build the tallest Lego tower you can using only one color. How tall can you get it before it falls?",
    category: "building",
  },
  {
    title: "Future You",
    description:
      "Imagine yourself 10 years from now. What are you doing? What cool skills have you learned? Write a day-in-the-life story!",
    category: "fun",
  },
  {
    title: "Save of the Day",
    description:
      "Describe the most epic goalie save you can imagine. Make it dramatic — like a sports commentator telling the story!",
    category: "hockey",
  },
  {
    title: "Recipe Inventor",
    description:
      "Invent a brand new snack or drink. What's it called? What's in it? Would you sell it at a hockey game?",
    category: "fun",
  },
  {
    title: "Space Engineer",
    description:
      "Design a space station using Lego-building principles. What rooms would it have? How would people live there?",
    category: "science",
  },
  {
    title: "Prank Video Planner",
    description:
      "Plan a funny (and harmless!) prank video. Write out the setup, the prank, and the reaction. Keep it friendly and fun!",
    category: "creative",
  },
  {
    title: "Team Captain Speech",
    description:
      "Imagine you're the captain of your hockey team. Write a 1-minute pump-up speech to get your team fired up before a big game!",
    category: "hockey",
  },
  {
    title: "Color Challenge Build",
    description:
      "Build a Lego creation using only 3 colors. The catch: it has to be something from nature!",
    category: "building",
  },
  {
    title: "What If?",
    description:
      "What if gravity worked backwards for one day? Write about what would happen and how you'd spend the day!",
    category: "science",
  },
  {
    title: "YouTube Channel Planner",
    description:
      "Plan your dream YouTube channel. What's it called? What are your first 5 video ideas? Design the channel logo!",
    category: "creative",
  },
  {
    title: "Hockey Hero Comic",
    description:
      "Create a short comic strip (3-4 panels) about a goalie who makes an impossible save. Describe or draw each panel!",
    category: "hockey",
  },
  {
    title: "Time Traveler",
    description:
      "If you could travel to any time period for one day, where would you go? What would you do? What would you bring back?",
    category: "fun",
  },
  {
    title: "Mechanical Marvel",
    description:
      "Design a Lego machine that does something useful around the house. Describe how it works step by step!",
    category: "building",
  },
  {
    title: "Nature Documentary",
    description:
      "Pick an animal in your neighborhood. Write a short nature documentary script about it, like you're David Attenborough!",
    category: "creative",
  },
  {
    title: "Hockey Physics",
    description:
      "What makes a slapshot so powerful? Think about the science — speed, force, and how the stick bends. Explain it in your own words!",
    category: "science",
  },
  {
    title: "Dream Room Designer",
    description:
      "Design your ultimate bedroom. What cool features would it have? A hockey shooting gallery? A Lego wall? A video studio? Go wild!",
    category: "fun",
  },
  {
    title: "Survival Challenge",
    description:
      "You're stranded on an island with only 5 items. What do you bring and why? How would you survive for a week?",
    category: "fun",
  },
];

export function getDailyChallenge(): DailyChallenge {
  const today = new Date().toISOString().split("T")[0];
  // Use the date to deterministically pick a challenge
  const dateNum = today.split("-").join("");
  const index = parseInt(dateNum) % CHALLENGES.length;
  const challenge = CHALLENGES[index];

  return {
    ...challenge,
    id: `challenge-${today}`,
    date: today,
  };
}

export function getAllChallenges(): DailyChallenge[] {
  const today = new Date().toISOString().split("T")[0];
  return CHALLENGES.map((c, i) => ({
    ...c,
    id: `challenge-${i}`,
    date: today,
  }));
}
