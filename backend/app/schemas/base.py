from pydantic import BaseModel, ConfigDict


class AppModel(BaseModel):
    # Общие настройки Pydantic: разрешаем aliases и обрезаем пробелы во входящих строках.
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True)
