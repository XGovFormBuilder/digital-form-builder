from abc import ABC, abstractmethod


class AnswerDisplayer(ABC):

    @property
    @abstractmethod
    def as_csv(self):
        raise NotImplementedError

    @property
    @abstractmethod
    def as_txt(self):
        raise NotImplementedError

    @property
    @abstractmethod
    def as_pdf(self):
        raise NotImplementedError
