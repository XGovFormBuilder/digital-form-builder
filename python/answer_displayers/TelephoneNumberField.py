from python.answer_displayers.shared.answer_displayer import AnswerDisplayer


class TelephoneNumberFieldDisplayer(AnswerDisplayer):
    def __init__(self, answer: str):
        self.raw_answer = answer

    @property
    def as_csv(self):
        return self.raw_answer

    @property
    def as_txt(self):
        return self.raw_answer

    @property
    def as_pdf(self):
        return self.raw_answer
