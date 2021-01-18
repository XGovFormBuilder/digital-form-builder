import React, { useEffect, useRef, useState } from "react";
import { Data } from "@xgovformbuilder/model";

import Page from "../../page";
import { Lines } from "./Lines";
import { Minimap } from "./Minimap";
import { Info } from "./Info";
import { getLayout, Layout, Pos } from "./getLayout";
import "./visualisation.scss";
import { DataContext } from "../../context";

type Props = {
  data: Data;
  id: string;
  updatedAt: string;
  downloadedAt: string;
  previewUrl: string;
  persona: any;
};

type State = {
  layout?: Layout["pos"];
};

function useVisualisation(ref) {
  const { data } = useContext(DataContext);
  const [layout, setLayout] = useState<Pos>();

  useEffect(() => {
    const schedule = setTimeout(() => {
      const layout = getLayout(data, ref.current!);
      setLayout(layout.pos);
    }, 200);
    return () => clearTimeout(schedule);
  }, [data]);

  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);
    console.log("component did mount");
    window.addEventListener("popstate", (event) => {
      event.preventDefault();
      console.log("popstate");
      alert("Are you sure you want to leave the designer?");
    });
  }, []);
  return { layout };
}

export function Visualisation(props: Props) {
  const ref = useRef(null);
  const { layout } = useVisualisation(ref);

  const { data, id, updatedAt, downloadedAt, previewUrl, persona } = props;
  const { pages } = data;

  const wrapperStyle = layout && {
    width: layout?.width,
    height: layout?.height,
  };

  return (
    <div className="visualisation">
      <div className="visualisation__pages-wrapper">
        <div ref={ref} style={wrapperStyle}>
          {pages.map((page, index) => (
            <Page
              id={id}
              key={index}
              data={data}
              page={page}
              persona={persona}
              previewUrl={previewUrl}
              layout={layout?.nodes[index]}
            />
          ))}

          {layout && <Lines layout={layout} data={data} persona={persona} />}
        </div>
      </div>

      {layout && <Info downloadedAt={downloadedAt} updatedAt={updatedAt} />}

      {layout && <Minimap layout={layout} />}
    </div>
  );
}
