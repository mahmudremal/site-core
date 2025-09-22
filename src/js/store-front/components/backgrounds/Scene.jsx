import React from "react";
import Fly from "./Fly";

// import flyConfig from './flies/housefly.json';
import flyConfig from './flies/butterfly.json';

export default function Scene() {
  return (
    <div style={{ position: "relative" }}>
      <Fly config={flyConfig} />
    </div>
  );
}
