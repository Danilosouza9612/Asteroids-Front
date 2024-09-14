import { Axios } from "axios";
import { api } from "src/boot/axios";

export class ApiCrudService{
  constructor(controllerName){
    this.controllerName = controllerName;
  }

  index({page=1, perPage=10, term=''}){
    return api.get(
      `${this.collectionPreffix()}?page=${page}&per_page=${perPage}&term=${term}`, 
      {
        crossdomain: true, 
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  get({id}){
    return api.get(this.memberPreffix(id));
  }

  create({data}){
    return api.post(this.collectionPreffix(), data);
  }

  update({id, data}){
    return api.patch(this.memberPreffix(id), data);
  }

  destroy({id}){
    return api.delete(this.memberPreffix(id));
  }

  memberPreffix(id){
    return `/${this.controllerName}/${id}`;
  }

  collectionPreffix(){
    return `/${this.controllerName}`;
  }
}