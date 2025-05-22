"""
Twitter Feed Application Launcher

This script runs the Flask application that displays tweets from Bitcoin influencers.
"""

from twitter_feed import app

if __name__ == "__main__":
    # Run the Flask app
    app.run(host='0.0.0.0', port=3000, debug=True)