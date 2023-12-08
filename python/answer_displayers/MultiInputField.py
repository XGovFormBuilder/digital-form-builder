from typing import Any

from python.answer_displayer import AnswerDisplayer


class MultiInputFieldDisplayer(AnswerDisplayer):
    def __init__(self, answer: list[str] | list[dict[str, Any]]):
        if answer:
            self.legacy = isinstance(answer[0], str)
        self.raw_answer = answer

    @property
    def _legacy_parsed_answer(self) -> str:
        parsed_answer: list[tuple[str, float]] = []
        for unparsed_answer in self.raw_answer:
            description, amount = unparsed_answer.rsplit(" : £", 1)
            answer = (description, float(amount))
            parsed_answer.append(answer)
        return "\n".join(
            f"{description}: £{amount:,.2f}" for description, amount in parsed_answer
        )

    @property
    def _parse_multi_input_component(self) -> list[dict[str, AnswerDisplayer]]:
        from python.dictionaries import (
            EXISTING_KEY_TO_TYPE_DICT,
            FIELD_TO_DISPLAYER_DICT_MULTI_INPUT,
        )

        raw_answer: list[dict[str, Any]] = self.raw_answer
        answer_displayers_dict_list: list[dict[str, AnswerDisplayer]] = []
        for answer_tuple in raw_answer:
            answer_displayer_dict = {}
            for key, answer in answer_tuple.items():
                answer_type = EXISTING_KEY_TO_TYPE_DICT[key]
                displayer = FIELD_TO_DISPLAYER_DICT_MULTI_INPUT[answer_type](answer)
                answer_displayer_dict[key] = displayer
            answer_displayers_dict_list.append(answer_displayer_dict)
        return answer_displayers_dict_list

    @property
    def as_csv(self) -> str | list[dict[str, AnswerDisplayer]]:
        if self.legacy:
            return self._legacy_parsed_answer
        else:
            return self._parse_multi_input_component

    @property
    def as_txt(self) -> str | list[dict[str, AnswerDisplayer]]:
        if self.legacy:
            return self._legacy_parsed_answer
        else:
            return self._parse_multi_input_component

    @property
    def as_pdf(self) -> str | list[dict[str, AnswerDisplayer]]:
        if self.legacy:
            return self._legacy_parsed_answer
        else:
            return self._parse_multi_input_component
