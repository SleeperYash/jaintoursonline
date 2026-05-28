import malaysiaImg from "@/assets/stamps/malaysia.png";
import singaporeImg from "@/assets/stamps/singapore.png";
import thailandImg from "@/assets/stamps/thailand.png";
import sriLankaImg from "@/assets/stamps/sri-lanka.png";
import kashmirImg from "@/assets/stamps/kashmir.png";
import himachalPradeshImg from "@/assets/stamps/himachal-pradesh.png";
import andamanImg from "@/assets/stamps/andaman.png";
import northEastImg from "@/assets/stamps/north-east-india.png";

export type StampKey =
  | "malaysia"
  | "singapore"
  | "thailand"
  | "sri-lanka"
  | "kashmir"
  | "himachal-pradesh"
  | "andaman"
  | "north-east-india";

export type StampSlot = {
  key: StampKey;
  label: string;
  borderColor: string;
  slug: string;
  image: string;
};

export const STAMP_SLOTS: StampSlot[] = [
  { key: "malaysia", label: "MALAYSIA", borderColor: "#D4860B", slug: "singapore-malaysia", image: malaysiaImg },
  { key: "singapore", label: "GEORGIA", borderColor: "#1A6FA8", slug: "georgia", image: singaporeImg },
  { key: "thailand", label: "THAILAND", borderColor: "#C0392B", slug: "thailand", image: thailandImg },
  { key: "sri-lanka", label: "SRI LANKA", borderColor: "#2E7D32", slug: "sri-lanka", image: sriLankaImg },
  { key: "kashmir", label: "KASHMIR", borderColor: "#5C7FA3", slug: "kashmir", image: kashmirImg },
  { key: "himachal-pradesh", label: "HIMACHAL PRADESH", borderColor: "#2C6B6B", slug: "himachal", image: himachalPradeshImg },
  { key: "andaman", label: "ANDAMAN", borderColor: "#00897B", slug: "andaman", image: andamanImg },
  { key: "north-east-india", label: "LEH LADAKH", borderColor: "#558B2F", slug: "leh-ladakh", image: northEastImg },
];