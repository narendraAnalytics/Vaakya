from langchain_groq import ChatGroq

from api.config import settings
from api.constants import GROQ_MODEL_FLASH, GROQ_MODEL_PRO


def get_llms() -> tuple[ChatGroq, ChatGroq]:
    """Returns (llm_pro, llm_flash). Call once at module level, not per request."""
    llm_pro = ChatGroq(
        model=GROQ_MODEL_PRO,
        api_key=settings.GROQ_API_KEY,
        temperature=0,
    )
    llm_flash = ChatGroq(
        model=GROQ_MODEL_FLASH,
        api_key=settings.GROQ_API_KEY,
        temperature=0,
    )
    return llm_pro, llm_flash
