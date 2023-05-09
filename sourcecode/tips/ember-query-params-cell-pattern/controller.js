import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

class MyQueryParams {
  @tracked foo = '';
  @tracked bar = '';
}

export default class MyController extends Controller {
  params = new MyQueryParams();
  queryParams = [
    { 'params.foo': 'foo' },
    { 'params.bar': 'bar' },
  ];
}
