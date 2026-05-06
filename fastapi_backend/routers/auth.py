from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import auth, models, schemas
from ..database import get_db
from ..serializers import user_to_read


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=schemas.AuthResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)) -> schemas.AuthResponse:
    user = (
        db.query(models.User)
        .filter(models.User.login == payload.login.strip(), models.User.role == payload.role)
        .first()
    )
    if user is None or not auth.verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid login or password")

    return schemas.AuthResponse(accessToken=auth.create_access_token(user), user=user_to_read(user))


@router.get("/me", response_model=schemas.UserRead)
def me(current_user: models.User = Depends(auth.get_current_user)) -> schemas.UserRead:
    return user_to_read(current_user)
