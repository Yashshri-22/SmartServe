terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "ap-south-1"
}

# Latest Ubuntu 24.04 LTS x86_64 AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_security_group" "smartserve_sg" {
  name        = "smartserve-fa1-sg"
  description = "FA1 security group for SmartServe"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "smartserve-fa1-sg"
  }
}

resource "aws_instance" "smartserve" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.small"
  key_name               = "fa1-key"
  vpc_security_group_ids = [aws_security_group.smartserve_sg.id]

  tags = {
    Name = "SmartServe-FA1"
  }
}

output "ec2_public_ip" {
  description = "Public IP address of SmartServe EC2"
  value       = aws_instance.smartserve.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of SmartServe EC2"
  value       = aws_instance.smartserve.public_dns
}