import os

from flask import Flask, render_template, request, redirect, url_for, session
from werkzeug.security import check_password_hash
from .db import get_db_connection


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    os.makedirs(app.instance_path, exist_ok=True)

    @app.route('/')
    def main():
        return render_template('index.html')

    @app.route('/home')
    def home():
        return render_template('index.html')

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if request.method == 'POST':
            username = request.form.get('username', '').strip()
            password = request.form.get('password', '')

            db = get_db_connection()
            cursor = db.cursor(dictionary=True)

            try:
                cursor.execute(
                    "SELECT user_id, username, password_hash "
                    "FROM users WHERE username = %s",
                    (username,)
                )

                user = cursor.fetchone()
            finally:
                cursor.close()
                db.close()

            if user and check_password_hash(
                user['password_hash'], password
            ):
                session.clear()
                session['user_id'] = user['user_id']
                session['username'] = user['username']

                return redirect(url_for('home'))

            return render_template(
                'login.html',
                error='Invalid username or password'
            )

        return render_template('login.html')

    @app.route('/sign-up')
    def signUp():
        return render_template('sign-up.html')

    @app.route('/logout', methods=['POST'])
    def logout():
        session.clear()
        return redirect(url_for('home'))

    @app.route('/playlists')
    def playlists():
        if session.get('user_id') is None:
            return redirect(url_for('login'))

        db = get_db_connection()
        try:
            cursor = db.cursor(dictionary=True)
            try:
                cursor.execute(
                    "SELECT p.playlist_id, p.playlist_name, "
                    "COUNT(ps.song_id) AS song_count "
                    "FROM playlists AS p "
                    "LEFT JOIN playlist_songs AS ps "
                    "ON ps.playlist_id = p.playlist_id "
                    "WHERE p.user_id = %s "
                    "GROUP BY p.playlist_id, p.playlist_name "
                    "ORDER BY p.playlist_name, p.playlist_id",
                    (session['user_id'],)
                )
                user_playlists = cursor.fetchall()
            finally:
                cursor.close()
        finally:
            db.close()

        return render_template('playlists.html', playlists=user_playlists)

    return app