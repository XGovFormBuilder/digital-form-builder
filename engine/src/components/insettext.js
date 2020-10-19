import Component from "./component";
export default class InsetText extends Component {
  getViewModel() {
    return {
      content: this.content,
    };
  }
}
