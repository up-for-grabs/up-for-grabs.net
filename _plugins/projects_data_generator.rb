module Jekyll
  class ProjectsDataGenerator < Generator
    def generate(site)
    	projects = site.data['projects']
			projects_hash = Hash[projects.map  { |u| [u["name"], u] }]

			tags_map = [] 
			projects.each do |u|
				tags_map = tags_map + u["tags"].map { |e| [e.downcase , u["name"]] }
			end
			tags_hash = Hash[tags_map.group_by(&:first).map{ |k,a| [k,a.map(&:last)] }]

			site.data['projects_data'] = {
				:tags => tags_hash,
				:projects => projects_hash
			} 
    end
  end
end