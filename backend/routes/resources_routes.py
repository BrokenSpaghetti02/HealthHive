"""
Resources and inventory endpoints.
"""

from fastapi import APIRouter, Depends
from datetime import datetime
from database import get_database
from auth import get_current_user

router = APIRouter(prefix="/api/resources", tags=["Resources"])

def sanitize_docs(items: list[dict]) -> list[dict]:
    cleaned = []
    for item in items:
        data = dict(item)
        if "_id" in data:
            data["_id"] = str(data["_id"])
        cleaned.append(data)
    return cleaned

DEFAULT_STOCK_ITEMS = [
    {
        "id": "med-001",
        "name": "Metformin 500mg",
        "currentStock": 4800,
        "avgMonthlyUse": 1200,
        "reorderPoint": 2400,
        "nextDeliveryETA": "2025-11-15",
        "daysOfSupply": 120
    },
    {
        "id": "med-002",
        "name": "Amlodipine 5mg",
        "currentStock": 1800,
        "avgMonthlyUse": 900,
        "reorderPoint": 1800,
        "nextDeliveryETA": "2025-11-10",
        "daysOfSupply": 60
    },
    {
        "id": "med-003",
        "name": "Losartan 50mg",
        "currentStock": 800,
        "avgMonthlyUse": 600,
        "reorderPoint": 1200,
        "nextDeliveryETA": "2025-11-05",
        "daysOfSupply": 40
    },
    {
        "id": "supply-001",
        "name": "Glucose Test Strips",
        "currentStock": 2400,
        "avgMonthlyUse": 1800,
        "reorderPoint": 3600,
        "nextDeliveryETA": "2025-11-08",
        "daysOfSupply": 40
    },
    {
        "id": "supply-002",
        "name": "Lancets",
        "currentStock": 5000,
        "avgMonthlyUse": 2000,
        "reorderPoint": 4000,
        "nextDeliveryETA": "2025-12-01",
        "daysOfSupply": 75
    }
]

DEFAULT_EQUIPMENT = [
    { "id": "tool-001", "name": "BP Monitors (Digital)", "currentStock": 12, "condition": "Good", "lastCalibration": "2025-09-15", "nextService": "2026-03-15", "inUse": 10, "available": 2 },
    { "id": "tool-002", "name": "BP Monitors (Manual)", "currentStock": 8, "condition": "Good", "lastCalibration": "2025-08-20", "nextService": "2026-02-20", "inUse": 6, "available": 2 },
    { "id": "tool-003", "name": "Glucometers", "currentStock": 15, "condition": "Good", "lastCalibration": "2025-10-01", "nextService": "2026-04-01", "inUse": 12, "available": 3 },
    { "id": "tool-004", "name": "Stethoscopes", "currentStock": 10, "condition": "Good", "lastCalibration": "N/A", "nextService": "N/A", "inUse": 8, "available": 2 },
    { "id": "tool-005", "name": "Weighing Scales", "currentStock": 6, "condition": "Fair", "lastCalibration": "2025-07-10", "nextService": "2026-01-10", "inUse": 5, "available": 1 },
    { "id": "tool-006", "name": "Height Measuring Boards", "currentStock": 6, "condition": "Good", "lastCalibration": "N/A", "nextService": "N/A", "inUse": 5, "available": 1 }
]

DEFAULT_CONSUMABLES = [
    { "id": "cons-001", "name": "Glucose Test Strips", "currentStock": 2400, "avgMonthlyUse": 1800, "daysOfSupply": 40, "reorderPoint": 3600, "category": "Testing Supplies" },
    { "id": "cons-002", "name": "Lancets", "currentStock": 5000, "avgMonthlyUse": 2000, "daysOfSupply": 75, "reorderPoint": 4000, "category": "Testing Supplies" },
    { "id": "cons-003", "name": "Alcohol Swabs", "currentStock": 3000, "avgMonthlyUse": 1200, "daysOfSupply": 75, "reorderPoint": 2400, "category": "Sterilization" },
    { "id": "cons-004", "name": "Cotton Balls", "currentStock": 1500, "avgMonthlyUse": 800, "daysOfSupply": 56, "reorderPoint": 1600, "category": "Wound Care" },
    { "id": "cons-005", "name": "Syringes (3ml)", "currentStock": 800, "avgMonthlyUse": 400, "daysOfSupply": 60, "reorderPoint": 800, "category": "Administration" },
    { "id": "cons-006", "name": "Bandages", "currentStock": 500, "avgMonthlyUse": 200, "daysOfSupply": 75, "reorderPoint": 400, "category": "Wound Care" }
]

DEFAULT_BURNDOWN = [
    { "month": "Oct", "metformin": 6000, "amlodipine": 2700, "losartan": 1400, "strips": 4200 },
    { "month": "Nov", "metformin": 4800, "amlodipine": 1800, "losartan": 800, "strips": 2400 },
    { "month": "Dec (Est)", "metformin": 3600, "amlodipine": 900, "losartan": 200, "strips": 600 },
    { "month": "Jan (Est)", "metformin": 2400, "amlodipine": 0, "losartan": 0, "strips": 0 }
]

DEFAULT_USAGE = [
    { "month": "May", "metformin": 1150, "amlodipine": 850, "losartan": 580, "strips": 1650 },
    { "month": "Jun", "metformin": 1180, "amlodipine": 880, "losartan": 600, "strips": 1720 },
    { "month": "Jul", "metformin": 1220, "amlodipine": 920, "losartan": 610, "strips": 1840 },
    { "month": "Aug", "metformin": 1190, "amlodipine": 900, "losartan": 595, "strips": 1780 },
    { "month": "Sep", "metformin": 1210, "amlodipine": 910, "losartan": 605, "strips": 1820 },
    { "month": "Oct", "metformin": 1200, "amlodipine": 900, "losartan": 600, "strips": 1800 }
]

@router.get("/summary")
async def get_resources_summary(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    if await db.inventory_items.count_documents({}) == 0:
        await db.inventory_items.insert_many(DEFAULT_STOCK_ITEMS)
    if await db.equipment_items.count_documents({}) == 0:
        await db.equipment_items.insert_many(DEFAULT_EQUIPMENT)
    if await db.consumable_items.count_documents({}) == 0:
        await db.consumable_items.insert_many(DEFAULT_CONSUMABLES)
    if await db.resource_burndown.count_documents({}) == 0:
        await db.resource_burndown.insert_many(DEFAULT_BURNDOWN)
    if await db.resource_usage.count_documents({}) == 0:
        await db.resource_usage.insert_many(DEFAULT_USAGE)

    stock_items = sanitize_docs(await db.inventory_items.find({}).to_list(length=1000))
    equipment = sanitize_docs(await db.equipment_items.find({}).to_list(length=1000))
    consumables = sanitize_docs(await db.consumable_items.find({}).to_list(length=1000))
    burndown = sanitize_docs(await db.resource_burndown.find({}).to_list(length=100))
    usage = sanitize_docs(await db.resource_usage.find({}).to_list(length=100))

    return {
        "stock_items": stock_items,
        "equipment_items": equipment,
        "consumables": consumables,
        "burndown": burndown,
        "usage": usage,
        "pending_orders": [
            {"id": "order-001", "item": "Metformin 500mg", "eta": "2025-11-15", "status": "In Transit"}
        ],
        "generated_at": datetime.utcnow()
    }
