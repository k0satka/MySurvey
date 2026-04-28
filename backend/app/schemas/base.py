from pydantic import BaseModel, ConfigDict


class AppModel(BaseModel):
    # Shared Pydantic defaults: allow aliases and trim incoming strings.
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True)
