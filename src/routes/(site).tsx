import type { ParentProps } from "solid-js";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MusicPlayer from "../components/MusicPlayer";
export default function SiteLayout(props: ParentProps) {
  return (
    <>
      <Header />
      {props.children}
      <Footer />
      <MusicPlayer />
    </>
  );
}
