import { Axios } from "axios";
import { api } from "src/boot/axios";

export class ApiCrudService{
  constructor(controllerName){
    this.controllerName = controllerName;
  }

  index({offset=0, limit=10, term=''}){
    return api.get(
      `${this.collectionPreffix()}?offset=${offset}&limit=${limit}&term=${term}`, 
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