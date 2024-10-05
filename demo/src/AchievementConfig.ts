import explorer from "./assets/achievements/explorer.webp";
import warrior from "./assets/achievements/warrior.webp";
import seasoned_warrior from "./assets/achievements/seaoned_warrior.webp";

const achievementConfig = {
  level: [
    {
      check: (value: number) => value >= 5,
      data: {
        id: "level_5",
        title: "Novice Adventurer",
        description: "Reached level 5",
        icon: explorer,
      },
    },
    {
      check: (value: number) => value >= 10,
      data: {
        id: "level_10",
        title: "Warrior",
        description: "Reached level 10",
        icon: warrior,
      },
    },
    {
      check: (value: number) => value >= 15,
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
