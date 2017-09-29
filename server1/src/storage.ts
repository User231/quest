
import * as mongodb from "mongodb";

export enum Collection {
  Users = "users",
  Messages = "messages",
  MapPoints = "map_points",
  MapPolylines = "map_polylines",
  MapPolygons = "map_polygons",
}

export class StorageService {
  
  protected db: mongodb.Db = undefined;
  public ready: boolean = false;

  protected collections: { [id: string]: mongodb.Collection } = {};
  
  constructor() {
    mongodb.MongoClient.connect(process.env.MONGODB_URI, (err, res) => {
      if (err) {
        console.log(err);
        process.exit(1);
      }
      this.db = res;
      Object.keys(Collection).forEach(key => this.collections[Collection[key]] = this.db.collection(Collection[key]));
      this.ready = true;
    });
  }

  public getCollection(collection: Collection): mongodb.Collection {
    return this.collections[collection];
  }
}
