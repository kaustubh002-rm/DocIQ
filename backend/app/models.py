from pydantic import BaseModel

class QuestionRequest(BaseModel):
    question: str


class SignupRequest(BaseModel):
    name:str
    email:str
    password:str


class LoginRequest(BaseModel):
    email:str
    password:str


class QuestionRequest(BaseModel):
    question:str