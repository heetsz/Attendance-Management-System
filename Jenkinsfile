pipeline {
    agent any

    tools {
        nodejs 'nodejs'
    }

    stages {
        stage('Git checkout') {
            steps {
                git url: "https://github.com/heetsz/Attendance-Management-System.git", branch: "main"
            }
        }
        
        stage('NPM Install') {
            steps {
                dir('Frontend') {   
                    sh 'npm install'
                }
            }
        }

        stage('Load dotenv') {
            steps {
                dir('Frontend') {
                    writeFile file: '.env', text: '''
VITE_API_URL=https://attendance-management-system-1kuv.onrender.com/api
'''
                }
            }
        }
        
        stage('Node Build') {
            steps {
                dir('Frontend') {   
                    sh 'npm run build'
                }
            }
        }
        
        stage('S3 Upload') {
            steps {
                withCredentials([
                    string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    dir('Frontend') {
                        sh '''
                        aws s3 sync dist/ s3://attendance-react-app --delete
                        '''
                    }
                }
            }
        }
    }
}