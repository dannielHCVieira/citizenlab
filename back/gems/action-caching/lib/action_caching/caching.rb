# frozen_string_literal: true

module ActionCaching
  module Caching
    extend ActiveSupport::Concern

    included do
      # Make ActionController::Caching available (needed for ActionController::API)
      include ActionController::Caching unless include?(ActionController::Caching)

      class_attribute :_action_cache_options, instance_accessor: false, default: {}
    end

    # Compatibility shim for actionpack-action_caching
    # Needed to work with ActionController::API (normally only in ActionController::Base)
    def action_has_layout=(value)
      value
    end

    module ClassMethods
      # Main DSL method for caching actions
      #
      # @example Basic usage
      #   caches_action :index, :show, expires_in: 1.minute
      #
      # @example With custom cache path
      #   caches_action :index, expires_in: 1.minute, cache_path: -> { request.query_parameters }
      #
      # @example With conditions
      #   caches_action :show, expires_in: 1.minute, if: :caching_active?
      #
      # @param actions [Array<Symbol>] List of action names to cache
      # @param options [Hash] Caching options
      # @option options [ActiveSupport::Duration] :expires_in Cache expiration time
      # @option options [Proc, Symbol] :cache_path Custom cache key generation
      # @option options [Symbol, Proc] :if Condition for caching
      # @option options [Symbol, Proc] :unless Inverse condition for caching
      def caches_action(*actions)
        options = actions.extract_options!
        around_filter = options.delete(:around_filter) || :around_action

        cache_options = options.extract!(:expires_in, :cache_path)
        filter_options = options

        actions.each do |action|
          _action_cache_options[action.to_sym] = cache_options
        end

        public_send(around_filter, filter_options.merge(only: actions)) do |controller, block|
          controller.send(:cache_action, &block)
        end
      end
    end

    private

    def cache_action
      action_name_sym = action_name.to_sym
      cache_options = self.class._action_cache_options[action_name_sym] || {}

      cache_key = compute_cache_key(cache_options[:cache_path])
      expires_in = cache_options[:expires_in]

      cached_response = read_cache(cache_key)

      if cached_response
        render_cached_response(cached_response)
      else
        # Execute the action and capture the response
        yield

        # Store the response in cache after rendering
        write_cache(cache_key, response, expires_in)
      end
    end

    def compute_cache_key(cache_path_option)
      # Format: views/{host}{path}.{format}
      # Example: views/example.org/web_api/v1/ideas.json

      path = request.path.sub(/\.\w+$/, '') # Remove extension if present
      format = request.format.symbol || :json

      "views/#{request.host}#{path}.#{format}"
    end

    def read_cache(key)
      cache_store.read(key)
    end

    def write_cache(key, response, expires_in)
      # For JSON API endpoints, we only need to cache body and status
      cached_response = {
        body: response.body,
        status: response.status
      }

      cache_store.write(key, cached_response, expires_in: expires_in)
    end

    def render_cached_response(cached_response)
      self.response_body = cached_response[:body]
      self.status = cached_response[:status]
      self.content_type = 'application/json; charset=utf-8'
    end

    def cache_store
      self.class.cache_store || Rails.cache
    end
  end
end
