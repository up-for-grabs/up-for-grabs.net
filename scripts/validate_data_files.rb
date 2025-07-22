# frozen_string_literal: true

require 'up_for_grabs_tooling'

root = Pathname.new(File.dirname(__dir__))

result = CommandLineValidator.validate(root)

CommandLineFormatter.output(result)

exit(1) unless result[:success]
