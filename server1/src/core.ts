


import { StorageService } from "./storage";

export class Core {
  protected static storageService;

  public static Init() {
    this.storageService = new StorageService();
  }

  public static getStorage(): StorageService {
    return Core.storageService;
  }
}
