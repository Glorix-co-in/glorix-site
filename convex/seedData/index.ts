import type { Infer } from "convex/values";
import type { contentValidators } from "../validators";
import events from "./events";
import artists from "./artists.json";
import teams from "./teams.json";
import gallery from "./gallery.json";
import carousel from "./carousel.json";
import collaborations from "./collaborations.json";
import campaigns from "./campaigns.json";
import marquee from "./marquee.json";
import testimonials from "./testimonials.json";
import terms from "./terms.json";

type Seeds = {
  [K in keyof typeof contentValidators]: Infer<(typeof contentValidators)[K]>[];
};

export const seeds: Seeds = {
  events,
  artists,
  teams,
  gallery,
  carousel,
  collaborations,
  campaigns: campaigns.map((campaign) => ({
    ...campaign,
    effects: {
      ...campaign.effects,
      homeCarousel: {
        ...campaign.effects.homeCarousel,
        position: campaign.effects.homeCarousel.position as "first" | "last",
      },
    },
  })),
  marquee,
  testimonials,
  terms: terms.map((text) => ({ text })),
};
