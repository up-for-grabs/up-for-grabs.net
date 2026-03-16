import { RawProjects } from '../components/data/projects';

export function GET({}) {
  return new Response(JSON.stringify(RawProjects));
}
