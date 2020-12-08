import React from "react";
import { Data } from "@xgovformbuilder/model";

import Page from "../../page";
import { Lines } from "./Lines";
import { Minimap } from "./Minimap";
import { Info } from "./Info";
import { getLayout, Layout } from "./getLayout";
import "./visualisation.scss";

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

export class Visualisation extends React.Component<Props, State> {
  ref = React.createRef<HTMLDivElement>();

  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  scheduleLayout() {
    setTimeout(() => {
      const { data } = this.props;
      const layout = getLayout(data, this.ref.current!);

      this.setState({
        layout: layout.pos,
      });
    }, 200);
  }

  componentDidMount() {
    this.scheduleLayout();
  }

  UNSAFE_componentWillReceiveProps() {
    this.scheduleLayout();
  }

  render() {
    const {
      data,
      id,
      updatedAt,
      downloadedAt,
      previewUrl,
      persona,
    } = this.props;
    const { pages } = data;

    const wrapperStyle = this.state.layout && {
      width: this.state.layout?.width,
      height: this.state.layout?.height,
    };

    return (
      <div className="visualisation">
        <div className="visualisation__pages-wrapper">
          <div ref={this.ref} style={wrapperStyle}>
            {pages.map((page, index) => (
              <Page
                id={id}
                key={index}
                data={data}
                page={page}
                persona={persona}
                previewUrl={previewUrl}
                layout={this.state.layout?.nodes[index]}
              />
            ))}

            {this.state.layout && (
              <Lines layout={this.state.layout} data={data} persona={persona} />
            )}
          </div>
        </div>

        {this.state.layout && (
          <Info downloadedAt={downloadedAt} updatedAt={updatedAt} />
        )}

        {this.state.layout && <Minimap layout={this.state.layout} />}
      </div>
    );
  }
}
