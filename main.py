from typing import Union
from fastapi import FastAPI
from fastapi.responses import FileResponse, HTMLResponse
import uvicorn
import os
import random
import string
from enum import Enum
from fastapi import FastAPI, Depends
from sqlalchemy import create_engine, Column, Integer, Float, String, ForeignKey, Boolean, Index, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.sql import func


# ===============================================================================
# config
DB_FILE = "app.db"


# ===============================================================================
# database
engine = create_engine(f"sqlite:///./{DB_FILE}/", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# declarate 
Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ===============================================================================
# app
app = FastAPI()


# ===============================================================================
# models
class NodeType(Enum):
    DOMAIN = {"id": 1, "value": "domain"}
    TOPIC  = {"id": 2, "value": "topic"}
    LEAF   = {"id": 3, "value": "leaf"}

class LinkType(Enum):
    HIERARCHY = {"id": 1, "value": "hierarchy"}
    SYNONYM   = {"id": 2, "value": "synonym"}
    ANALOG    = {"id": 3, "value": "analog"}
    CAUSE     = {"id": 4, "value": "cause"}
    LINK      = {"id": 5, "value": "link"} # simple association

class Node(Base):
    __tablename__ = "nodes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    active_on = Column(Boolean, default=True, nullable=False) 
    type = Column(Integer, default=NodeType.LEAF.value['id'], nullable=False)
    veight = Column(Integer, default=30, nullable=False) # from 0 to 100
    name = Column(String, nullable=False)
    coord_x = Column(Float, nullable=True)
    coord_y = Column(Float, nullable=True)
    coord_z = Column(Float, nullable=True)
    description = Column(String, nullable=True)
    time_created = Column(DateTime(timezone=True), server_default=func.now())
    #time_updated = Column(DateTime(timezone=True), onupdate=func.now())

    index_name = Index('index_node_name', name)
    index_description = Index('index_node_description', description)

class Link(Base):
    __tablename__ = "links"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    active_on = Column(Boolean, default=True, nullable=False)
    type = Column(Integer, default=LinkType.HIERARCHY.value['id'], nullable=False)
    veight = Column(Integer, default=30, nullable=False) # from 0 to 100
    parent_id = Column(Integer, ForeignKey("nodes.id"), index=True, nullable=False)
    child_id = Column(Integer, ForeignKey("nodes.id"), index=True, nullable=False)
    description = Column(String, nullable=True)
    time_created = Column(DateTime(timezone=True), server_default=func.now())
    #time_updated = Column(DateTime(timezone=True), onupdate=func.now())

    # Indexes
    index_description = Index('index_link_description', description)

class Changes(Base):
    __tablename__ = 'changes'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    node_id = Column(Integer, ForeignKey("nodes.id"), index=True, nullable=True)
    link_id = Column(Integer, ForeignKey("links.id"), index=True, nullable=True)
    time = Column(DateTime(timezone=True), server_default=func.now())
    old_state = Column(JSON, nullable=False)


# create db file if db file not exists
if os.path.isfile(DB_FILE) is False:
    Base.metadata.create_all(bind=engine)

# ===============================================================================
# data

def random_string(min_lenght=8, max_length=8):
    return ''.join(random.choice(string.ascii_lowercase + " ") for _ in range(random.randint(min_lenght, max_length)))

def random_link_type():
    return random.choice(list(LinkType)).value['id']

def generate_dummy_nodes(count):
    nodes = []
    for _ in range(count):
        nodes.append({
            "name": random_string(4, 8).strip(),
            "type": random.choice(list(NodeType)).value['id'],
            "veight": random.randint(20, 50),
            "coord_x": round(random.uniform(0, 10), 3),
            "coord_y": round(random.uniform(0, 10), 3),
            "coord_z": round(random.uniform(0, 10), 3),
            "description": random_string(5, 20).strip()
        })
    return nodes 

def generate_dummy_links(links_count, nodels_count):
    links = []
    for _ in range(links_count):
        links.append({
            "type": random.choice(list(LinkType)).value['id'],
            "veight": random.randint(20, 50),
            "parent_id": random.randint(1, nodels_count),
            "child_id": random.randint(1, nodels_count),
            "description": random_string(5, 20).strip()
        })
    return links 


# ===============================================================================
# service
def fill_dummy_data_to_db(db):
    nodes_count = 50
    links_count = 30

    dummy_nodes = generate_dummy_nodes(nodes_count)
    for node in dummy_nodes:
        db.merge(Node(**node))
        db.commit()

    dummy_links = generate_dummy_links(links_count, nodes_count)
    for link in dummy_links:
        db.merge(Link(**link))
        db.commit()


# ===============================================================================
# controller
# ----------------------------------------
# page
@app.get("/")
async def root():
    return FileResponse('web/index.html')

@app.get("/favicon.ico")
async def web_favicon():
    return FileResponse('web/favicon.ico')

@app.get("/wallpaper.jpg")
async def web_wallpaper():
    return FileResponse('web/wallpaper.jpg')

@app.get("/style.css")
async def web_vuejs():
    return FileResponse('web/style.css')

@app.get("/script_d3.js")
async def web_vuejs():
    return FileResponse('web/script_d3.js')

@app.get("/script_vue.js")
async def web_vuejs():
    return FileResponse('web/script_vue.js')

# ----------------------------------------
# api
@app.get("/api/nodes")
def read_nodes(q: Union[str, None] = None, db: Session = Depends(get_db)):
    return {
        "success": True,
        "payload": db.query(Node).all() ,
        "description": ""
    }

@app.get("/api/nodes/{item_id}")
def read_node(item_id: int, q: Union[str, None] = None, db: Session = Depends(get_db)):
    return {
        "success": True,
        "payload": db.query(Link).filter(Node.id == item_id).first(),
        "description": ""
    }

@app.get("/api/links")
def read_links(q: Union[str, None] = None, db: Session = Depends(get_db)):
    return {
        "success": True,
        "payload": db.query(Link).all(),
        "description": ""
    }

@app.get("/api/links/{item_id}")
def read_link(item_id: int, q: Union[str, None] = None, db: Session = Depends(get_db)):
    return {
        "success": True,
        "payload": db.query(Link).filter(Link.id == item_id).first(),
        "description": ""
    }

# ----------------------------------------
# rpc
@app.get("/api/db_fill")
def read_link(q: Union[str, None] = None, db: Session = Depends(get_db)):
    fill_dummy_data_to_db(db)
    return {"success": True,}


# ===============================================================================
# main
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)