import explorer from "./assets/achievements/explorer.webp";
import warrior from "./assets/achievements/warrior.webp";
import seasoned_warrior from "./assets/achievements/seaoned_warrior.webp";

const achievementConfig = {
  level: [
    {
      check: (value) => value >= 5,
      data: {
        id: "level_5",
        title: "Novice Adventurer",
        description: "Reached level 5",
        icon: explorer,
      },
    },
    {
      check: (value) => value >= 10,
      data: {
        id: "level_10",
        title: "Warrior",
        description: "Reached level 10",
        icon: warrior,
      },
    },
    {
      check: (value) => value >= 15,
      data: {
        id: "level_15",
        title: "Seasoned Warrior",
        description: "Reached level 15",
        icon: seasoned_warrior,
      },
    }
  ],
};

export default achievementConfig;
