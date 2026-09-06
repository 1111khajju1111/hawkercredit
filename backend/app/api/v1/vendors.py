from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.schema import Vendor
from app.schemas.dto import VendorCreate, VendorResponse
from app.core.security import verify_vendor_access, require_roles, get_current_user

router = APIRouter()


@router.get("", response_model=List[VendorResponse])
def list_vendors(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["LENDER", "ADMIN"])),
):
    """
    Listing every vendor is a lender/admin-only operation - vendors
    themselves have no legitimate reason to enumerate other vendors'
    profiles, and this endpoint previously had no auth at all.
    """
    vendors = db.query(Vendor).all()
    return vendors


@router.get("/{vendor_id}", response_model=VendorResponse)
def get_vendor(
    vendor_id: str,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_vendor_access),
):
    vendor = db.query(Vendor).filter(Vendor.vendor_id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor


@router.post("", response_model=VendorResponse)
def create_vendor(
    vendor_in: VendorCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    The vendor profile is always created for the AUTHENTICATED caller
    (current_user.id) - never for an arbitrary `user_id` supplied by the
    client, which previously let anyone create (or overwrite ownership
    assumptions for) a vendor profile under any user's identity.
    """
    existing = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="A vendor profile already exists for this user")

    vendor = Vendor(
        user_id=current_user.id,
        name=vendor_in.name,
        phone=vendor_in.phone,
        business_type=vendor_in.business_type,
        business_description=vendor_in.business_description,
        location=vendor_in.location,
        operating_since=vendor_in.operating_since,
        operating_days=vendor_in.operating_days
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor
