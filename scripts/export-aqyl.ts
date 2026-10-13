import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { writeFileSync } from "node:fs";
import { Robot } from "../src/components/ui";
Object.assign(globalThis, { React });
const html = renderToStaticMarkup(React.createElement(Robot));
let svg = html
  .slice(html.indexOf("<svg"), html.indexOf("</svg>") + 6)
  .replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
svg = svg.replace(
  "><ellipse",
  "><style>.soul-eyes,.soul-thought,.soul-spark{display:none}.soul-normal{display:block}</style><ellipse",
);
writeFileSync("public/aqyl.svg", svg);
