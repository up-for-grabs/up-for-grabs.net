# frozen_string_literal: true

# Validate the data files
class DataFilesReporter
  def self.check(root)
    schema = Pathname.new("#{root}/schema.json")
    schemer = JSONSchemer.schema(schema)

    result = DataFilesValidator.validate(root, schemer)

    if result[:errors].any?
      puts "#{result[:errors].count} files found with errors:"
      result[:errors].each do |key, errors|
        puts " - #{key}:"
        errors.each { |error| puts "    - #{error}" }
      end
      exit(-1)
    else
      puts "#{result[:count]} files processed - no errors found!"
    end
  end
end
